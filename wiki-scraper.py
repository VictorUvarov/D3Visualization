import requests
from bs4 import BeautifulSoup
import pprint

data = requests.get(
    'https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3#Uses_and_applications')

soup = BeautifulSoup(data.text, 'html.parser')

data = []
count = 1

for country_list in soup.find_all('div', {'class': 'plainlist'}):
    for country_list_item in country_list.find_all('ul'):
        for li in country_list_item.find_all('li'):
            country_code = li.find_all('span')[0].text.strip()
            country_name = li.find_all('a')[0].get('title')
            item = {'id': count, 'code': country_code, 'name': country_name}
            data.append(item)
            count = count + 1
            
pp = pprint.PrettyPrinter(indent=4)
pp.pprint(data)

    
