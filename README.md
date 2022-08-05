1) first clone 
2) run npm install
3) open terminal and write following commands 



no parameters will return => the latest portfolio value per token in USD
node index.js

--token only as parameter will return => latest portfolio value for that token in USD
node index.js --token=ETH




--date only as parameter will return => portfolio value per token in USD on that date
node index.js --date=4/3/2018

--date & --token parameters will return => portfolio value of that token in USD on that date
node index.js --date=4/3/2018 --token=ETH





