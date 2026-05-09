from django.db import models
from django.contrib.auth.models import User
import uuid
import datetime

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    account_id = models.CharField(max_length=20, unique=True, blank=True)
    company_name = models.CharField(max_length=100, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.account_id:
            if self.user.id:
                self.account_id = f"USR-{1000 + self.user.id}"
            else:
                self.account_id = f"USR-{uuid.uuid4().hex[:6].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} - {self.account_id}"

class Customer(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='customers')
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Product(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock_quantity = models.IntegerField(default=0)
    gst_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Invoice(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='invoices')
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, related_name='invoices')
    invoice_id = models.CharField(max_length=30, unique=True, blank=True)
    date = models.DateTimeField(auto_now_add=True)
    
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    received_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    
    previous_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    new_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    
    remarks = models.TextField(blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.invoice_id:
            year = datetime.datetime.now().year
            last_record = Invoice.objects.filter(invoice_id__startswith=f"INV-{year}-").order_by('-id').first()
            if last_record:
                last_count = int(last_record.invoice_id.split('-')[-1])
                count = last_count + 1
            else:
                count = 1
            self.invoice_id = f"INV-{year}-{count:04d}"
            
        self.balance = float(self.total_amount) - float(self.received_amount)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.invoice_id

class InvoiceItem(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    product_name_snapshot = models.CharField(max_length=100) 
    
    quantity = models.IntegerField(default=1)
    price_per_unit = models.DecimalField(max_digits=10, decimal_places=2)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    gst_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    final_amount = models.DecimalField(max_digits=12, decimal_places=2, blank=True)

    def save(self, *args, **kwargs):
        base_price = float(self.price_per_unit) * int(self.quantity)
        discount_amount = base_price * (float(self.discount_percentage) / 100)
        price_after_discount = base_price - discount_amount
        gst_amount = price_after_discount * (float(self.gst_percentage) / 100)
        self.final_amount = price_after_discount + gst_amount
        super().save(*args, **kwargs)

class PaymentHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments')
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='payments')
    invoice = models.ForeignKey(Invoice, on_delete=models.SET_NULL, null=True, blank=True, related_name='payments')
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateTimeField(auto_now_add=True)
    payment_method = models.CharField(max_length=50, blank=True, null=True)

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        if is_new:
            self.customer.balance = float(self.customer.balance) - float(self.amount_paid)
            self.customer.save()
            
            if self.invoice:
                self.invoice.received_amount = float(self.invoice.received_amount) + float(self.amount_paid)
                self.invoice.save()
