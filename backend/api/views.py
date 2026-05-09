from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from django.contrib.auth.models import User
from .models import UserProfile, Customer, Product, Invoice, InvoiceItem, PaymentHistory
from .serializers import (
    RegisterSerializer, UserSerializer, CustomerSerializer, 
    ProductSerializer, InvoiceSerializer, InvoiceItemSerializer, PaymentHistorySerializer
)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user

class CustomerViewSet(ModelViewSet):
    serializer_class = CustomerSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Customer.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ProductViewSet(ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Product.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class InvoiceViewSet(ModelViewSet):
    serializer_class = InvoiceSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Invoice.objects.filter(user=self.request.user).order_by('-date')

    def create(self, request, *args, **kwargs):
        data = request.data
        items_data = data.pop('items', [])
        
        # Calculate totals
        total_amount = 0
        for item in items_data:
            base_price = float(item['price_per_unit']) * int(item['quantity'])
            discount_amount = base_price * (float(item.get('discount_percentage', 0)) / 100)
            price_after_discount = base_price - discount_amount
            gst_amount = price_after_discount * (float(item.get('gst_percentage', 0)) / 100)
            total_amount += (price_after_discount + gst_amount)

        # Create Invoice
        invoice_serializer = self.get_serializer(data=data)
        invoice_serializer.is_valid(raise_exception=True)
        invoice = invoice_serializer.save(user=request.user, total_amount=total_amount)
        
        # Create Items and deduct stock
        for item_data in items_data:
            product = Product.objects.get(id=item_data['product'])
            InvoiceItem.objects.create(
                invoice=invoice,
                product=product,
                product_name_snapshot=product.name,
                quantity=item_data['quantity'],
                price_per_unit=item_data['price_per_unit'],
                discount_percentage=item_data.get('discount_percentage', 0),
                gst_percentage=item_data.get('gst_percentage', 0)
            )
            # Deduct stock
            product.stock_quantity -= int(item_data['quantity'])
            product.save()
            
        # Calculate balances
        previous_balance = float(invoice.customer.balance)
        # The invoice 'balance' is (total - received).
        # We add this unpaid portion to the customer's account.
        new_balance = previous_balance + float(invoice.balance)
        
        invoice.previous_balance = previous_balance
        invoice.new_balance = new_balance
        invoice.save()
        
        # Update customer balance
        invoice.customer.balance = new_balance
        invoice.customer.save()
        
        # If received_amount > 0, create payment record
        received = float(data.get('received_amount', 0))
        if received > 0:
            PaymentHistory.objects.create(
                user=request.user,
                customer=invoice.customer,
                invoice=invoice,
                amount_paid=received,
                payment_method="Cash" 
            )
            
        return Response(self.get_serializer(invoice).data, status=status.HTTP_201_CREATED)

class DashboardStatsView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        invoices = Invoice.objects.filter(user=request.user)
        total_invoices = invoices.count()
        total_sales = sum([i.total_amount for i in invoices])
        pending_payments = sum([i.balance for i in invoices])
        total_customers = Customer.objects.filter(user=request.user).count()
        recent_invoices = InvoiceSerializer(invoices.order_by('-date')[:5], many=True).data
        
        return Response({
            'total_invoices': total_invoices,
            'total_sales': total_sales,
            'pending_payments': pending_payments,
            'total_customers': total_customers,
            'recent_invoices': recent_invoices
        })
