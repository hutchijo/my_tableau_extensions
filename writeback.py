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

# Define the model for our ext_products table
class Ext_products(peewee.Model):
    product_asin = peewee.CharField()    
    product_mpn  = peewee.CharField()
    product_title = peewee.CharField()
    product_manufacturer = peewee.CharField()
    product_brand  = peewee.CharField()
    product_package_quantity = peewee.IntegerField()
    product_color = peewee.CharField()
    product_size = peewee.CharField()
    product_price = peewee.FloatField()
    product_group = peewee.CharField() 
    product_image = peewee.TextField()    
    product_description = peewee.TextField()
    quantity_purchased = peewee.IntegerField()
    last_purchased = peewee.DateTimeField() 
    
    # Specify the database for this model
    class Meta:
        database = db

# This function saves the product and quantity to the database
def save_product_to_database(all_product_info, product_quantity):
    
    # Loop through the products
    for product in (all_product_info):
    
        # Define variables
        last_purchased_datetime = datetime.datetime.strptime(str(datetime.datetime.now().replace(microsecond=0)),'%Y-%m-%d %H:%M:%S')
    
        try:
            
            # Open the database
            db.connect()
            
            # Define the details for the product
            current_product_to_save = Ext_products(
                product_asin = product["product_asin"],
                product_mpn  = product["product_mpn"],
                product_title = product["product_title"][1:-1],
                product_manufacturer = product["product_manufacturer"],
                product_brand  = product["product_brand"],
                product_package_quantity =  product["product_package_quantity"],
                product_color = product["product_color"],
                product_size = product["product_size"],
                product_price = product["product_price"],
                product_group = product["product_group"],
                product_image = product["product_image"][2:-1],
                product_description = product["product_description"].replace("'", ""),
                quantity_purchased = product_quantity,
                last_purchased = last_purchased_datetime)   

            # Save the product
            current_product_to_save.save()
            
            # Close the database
            db.close()

        except Exception, ex:            

            # Print the exception to the console
            print ex 
            
            print 'product_asin = ' + product["product_asin"] 
            print 'product_mpn = ' + product["product_mpn"]
            print 'product_title = ' +  product["product_title"][1:-1]
            print 'product_manufacturer = ' +  product["product_manufacturer"]
            print 'product_brand  = ' +  product["product_brand"]
            print 'product_package_quantity= ' + product["product_package_quantity"]
            print 'product_color = ' +  product["product_color"]
            print 'product_size = ' +  product["product_size"]
            print 'product_price = ' +  product["product_price"]
            print 'product_group = ' +  product["product_group"]
            print 'product_image = ' +  product["product_image"][2:-1]
            print 'product_description = ' +  product["product_description"].replace("'", "")
            print 'quantity_purchased = ' +  str(product_quantity)

        