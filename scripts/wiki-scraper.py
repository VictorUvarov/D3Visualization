import requests
from bs4 import BeautifulSoup
import pprint
import csv

data = requests.get(
    'https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3#Uses_and_applications')

soup = BeautifulSoup(data.text, 'html.parser')

data = []
count = 1
headers = ['id', 'country_code', 'country_name']
data.append(headers)


for country_list in soup.find_all('div', {'class': 'plainlist'}):
    for country_list_item in country_list.find_all('ul'):
        for li in country_list_item.find_all('li'):
            country_code = li.find_all('span')[0].text.strip()
            country_name = li.find_all('a')[0].get('title')
            l = [count, country_code, country_name]
            data.append(l)
            count = count + 1

with open('countries.csv', 'w') as new_file:
    wr = csv.writer(new_file, quoting=csv.QUOTE_ALL)
    wr.writerow(data)
