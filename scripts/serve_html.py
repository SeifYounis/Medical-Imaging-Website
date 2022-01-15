import sys, json

lines = sys.stdin.readlines()

#Since our input would only be having one line, parse our JSON data from that
data = json.loads(lines[0])

username = data['username']

print(f"<h1>Hi there. Your username is {username}</h1>", end='')