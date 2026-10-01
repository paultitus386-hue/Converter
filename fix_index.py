import re

with open('C:/Users/nandi/OneDrive/Documents/Titus files/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Add viewport-fit=cover
old_viewport = '<meta name="viewport" content="width=device-width, initial-scale=1.0" />'
new_viewport = '<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />'
content = content.replace(old_viewport, new_viewport)

# Add format-detection and theme-color before description meta
old_desc = '<meta name="description" content="Production-grade Text-to-Speech, Speech-to-Text, and Recents Storage Web Application. Fully functional on localhost or any static web host." />'
new_desc = '''<meta name="format-detection" content="telephone=no" />
  <meta name="msapplication-tap-highlight" content="no" />
  <meta name="theme-color" content="#ffffff" />
  <meta name="description" content="Production-grade Text-to-Speech, Speech-to-Text, and Recents Storage Web Application. Fully functional on localhost or any static web host." />'''
content = content.replace(old_desc, new_desc)

with open('C:/Users/nandi/OneDrive/Documents/Titus files/index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done - index.html updated')