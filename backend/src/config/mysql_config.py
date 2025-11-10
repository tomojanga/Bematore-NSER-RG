"""
MySQL Configuration Helper
Use PyMySQL as MySQLdb replacement if mysqlclient installation fails
"""
import pymysql

# Install PyMySQL as MySQLdb replacement
pymysql.install_as_MySQLdb()
