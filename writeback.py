import os
import sys
import datetime
import peewee
from peewee import *
from flask import json, jsonify


#--------------------------------------------------------------------------------------------
# 02/15/2018
#
# This library contains the helper functions used to
# writeback to a MySQL database.  This library uses Peewee which 
# is a simple and small ORM that can be used with Postgresql, MySQL
# and SQLite.  More information can be found here:
# http://docs.peewee-orm.com/en/latest/index.html
#
#--------------------------------------------------------------------------------------------

# Create the path for the config file which stores credentials to the database credentials
database_config_path = 'static/config/database_config_file'

# Open our database config file to read in the credentials - the format is colon seperated - db_name:db_username:db_password
with open(database_config_path, 'r') as db_config:
    credentials = [x.strip().split(':') for x in db_config.readlines()]

# Set the database credentials from the values in the database_config_file file
database_name= credentials[0][0]
database_user = credentials[0][1]
database_password = credentials[0][2]

# Define a connection to the local MySQL database
db = MySQLDatabase(database_name, user=database_user, passwd=database_password)

# Define the model for our ext_pending_orders table
class Ext_all_orders(peewee.Model):
    order_id = peewee.CharField() 
    order_date = peewee.DateTimeField() 
    order_quantity = peewee.IntegerField()
    vendor_name = peewee.CharField() 
    product_asin = peewee.CharField()    
    product_mpn  = peewee.CharField()
    product_title = peewee.CharField()
    product_manufacturer = peewee.CharField()
    product_brand  = peewee.CharField()
    product_price = peewee.FloatField()
    product_group = peewee.CharField() 
    product_image = peewee.TextField()    
    product_description = peewee.TextField()
    product_category = peewee.CharField() 
    product_sub_category = peewee.CharField() 
    purchaser_name = peewee.CharField() 
    purchaser_region = peewee.CharField() 
    purchaser_state = peewee.CharField() 
    purchaser_city = peewee.CharField() 
    off_contract = peewee.IntegerField() 
    
    # Specify the database for this model
    class Meta:
        database = db

# Define the model for our ext_inventory table
class Ext_inventory(peewee.Model):
    product_asin = peewee.CharField()  
    stock_level = peewee.IntegerField()
    reorder_level = peewee.IntegerField()
    region = peewee.DateTimeField() 
    
    # Specify the database for this model
    class Meta:
        database = db

# This function saves the product and quantity to the database
def save_product_to_database(all_product_info, product_quantity):
    
    # Loop through the products
    for product in (all_product_info):
    
        # Define variables
        last_purchased_datetime = datetime.datetime.strptime(str(datetime.datetime.now().replace(microsecond=0)),'%Y-%m-%d %H:%M:%S')
        now = datetime.datetime.now()
        curr_order_id = 'TX-' + now.strftime('%Y-%H%M%S')
        curr_purchaser_region = 'Central'
        curr_purchaser_name = 'Roland Deschain'
        curr_purchaser_state = 'Texas'
        curr_purchaser_city = 'Austin'
        curr_vendor_name = 'Amazon'
        
        try:
            
            # Open the database
            db.connect()
            
            # Define the details for the order
            current_order = Ext_all_orders(
                order_id = curr_order_id,
                order_date = last_purchased_datetime,
                order_quantity = product_quantity,
                vendor_name = 'Amazon', 
                product_asin = product["product_asin"],
                product_mpn  = product["product_mpn"],
                product_title = product["product_title"][1:-1],
                product_manufacturer = product["product_manufacturer"],
                product_brand  = product["product_brand"],
                product_price = product["product_price"],
                product_group = product["product_group"],
                product_image = product["product_image"][2:-1],
                product_description = product["product_description"].replace("'", ""),
                product_category = '',
                product_sub_category = '',
                purchaser_name = curr_purchaser_name,
                purchaser_region = curr_purchaser_region,
                purchaser_state = curr_purchaser_state,
                purchaser_city = curr_purchaser_city,
                off_contract = 0)   
            
            # Define the details for the inventory                     
            current_inventory = Ext_inventory.update(
                stock_level = Ext_inventory.stock_level + product_quantity).where(Ext_inventory.product_asin == product["product_asin"], Ext_inventory.region == curr_purchaser_region)
                
            # Save the order 
            current_order.save()
                     
            # Update the inventory
            current_inventory.execute()
            
            # Close the database
            db.close()

        except Exception, ex:            

            # Print the exception to the console
            print ex 
            
            print 'product_asin = ' + product["product_asin"] 
            print 'product_mpn = ' + product["product_mpn"]
            print 'product_title = ' +  product["product_title"][1:-1]
            print 'product_manufacturer = ' + product["product_manufacturer"]
            print 'product_brand  = ' +  product["product_brand"]
            print 'product_price = ' +  product["product_price"]
            print 'product_group = ' +  product["product_group"]
            print 'product_image = ' +  product["product_image"][2:-1]
            print 'product_description = ' +  product["product_description"].replace("'", "")
            print 'quantity_purchased = ' +  str(product_quantity)

        