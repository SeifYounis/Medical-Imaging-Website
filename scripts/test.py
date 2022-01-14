#!/usr/bin/env python

import os
from dotenv import load_dotenv
import datetime

import numpy as np
import pandas as pd
import psycopg2

load_dotenv()

DATABASE_URL = os.environ['DATABASE_URL']

conn = psycopg2.connect(DATABASE_URL, sslmode='require')

cur = conn.cursor()

# cur.execute("CREATE TABLE test (id serial PRIMARY KEY, num integer, data varchar);")

# Pass data to fill query placeholders and let Psycopg perform the correct conversion (no more SQL injections!)
# cur.execute("INSERT INTO test (num, data) VALUES (%s, %s)", (100, "abc'def"))

# Potential queries include
# SELECT * FROM results
# SELECT * FROM results WHERE DATE_TRUNC('day', answer_date) >= current_date - interval '1 day';
# SELECT * FROM results WHERE DATE_TRUNC('hour', answer_date) >= current_date - interval '1 hour';
# SELECT * FROM results WHERE DATE_TRUNC('week', answer_date) = current_date
# SELECT * FROM results WHERE DATE_TRUNC('year', answer_date) = current_date;

# Query the database and obtain data as list of tuples. This gets you all results data obtained at present day
query = "SELECT * FROM results WHERE DATE_TRUNC('day', answer_date) = current_date;"
cur.execute(query)
data = cur.fetchall()

# If you want to fetch one at a time, you can do
# data = list()
# row = cur.fetchone()
# while row is not None:
#     data.append(row)
#     row = cur.fetchone()

for d in data:
    print(d)

print()

# Create DataFrame using data
df = pd.DataFrame(data, columns =['session_id', 'student_id', 'username', 'assessment', 'prompt_image', 'answer', 'solution', 'answer_date'])
print(df, '\n')
print(df.username, '\n')
print(df.dtypes, '\n')

# Or a Numpy recarray if that's more your style
arr = np.array(data, dtype=[('session_id', 'object'), ('student_id', 'object'), ('username', 'object'), ('assessment', 'object'), 
('prompt_image', 'object'), ('answer', 'object'), ('solution', 'object'), ('answer_date', 'object')])

arr = arr.view(np.recarray)
print(arr)

# Make the changes to the database persistent
conn.commit()

# Close communication with the database
cur.close()
conn.close()
