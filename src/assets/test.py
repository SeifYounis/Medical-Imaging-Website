#!/usr/bin/env python

import os
from dotenv import load_dotenv
import psycopg2

load_dotenv()

DATABASE_URL = os.environ['DATABASE_URL']

conn = psycopg2.connect(DATABASE_URL, sslmode='require')

cur = conn.cursor()

# cur.execute("CREATE TABLE test (id serial PRIMARY KEY, num integer, data varchar);")

# Pass data to fill a query placeholders and let Psycopg perform
# the correct conversion (no more SQL injections!)
cur.execute("INSERT INTO test (num, data) VALUES (%s, %s)", (100, "abc'def"))

# Query the database and obtain data as Python objects
cur.execute("SELECT * FROM test;")
print(cur.fetchone())

# Make the changes to the database persistent
conn.commit()

# Close communication with the database
cur.close()
conn.close()
