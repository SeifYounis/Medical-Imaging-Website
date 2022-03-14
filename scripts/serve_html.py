#! /usr/bin/env python

import sys, json, os

lines = sys.stdin.readlines()

#Since our input would only have one line, parse our JSON data from that
data = json.loads(lines[0])

username = data["username"]

scriptoutput = f"<h1>Hi there. Your username is {username}</h1>"

with open("./static/test.html", "w", encoding="utf-8") as o:
    o.write(scriptoutput)

print("Operation was successful")