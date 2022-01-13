const PORT = process.env.PORT || 8000;
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

const newspapers = [
	{
		name: 'thewashingtonpost',
		address: 'https://www.washingtonpost.com/climate-environment/',
		base: '',
	},
	{
		name: 'guardian',
		address: 'https://www.theguardian.com/environment/climate-crisis',
		base: '',
	},
	{
		name: 'newyorktimes',
		address: 'https://www.nytimes.com/section/climate',
		base: 'https://www.nytimes.com',
	},
	{
		name: 'thetimes',
		address: 'https://www.thetimes.co.uk/environment/climate-change',
		base: '',
	},
];

const articles = [];

newspapers.forEach((newspaper) => {
	axios
		.get(newspaper.address)
		.then((response) => {
			const html = response.data;
			const $ = cheerio.load(html);

			$('a:contains("climate")', html).each(function () {
				const title = $(this).text();
				const url = $(this).attr('href');

				articles.push({
					title,
					url: newspaper.base + url,
					source: newspaper.name,
				});
			});
		})
		.catch((err) => console.log('--error--', err));
});

app.get('/', (req, res) => {
	res.json('Welcome to my Climate Change News API!');
});

app.get('/news', (req, res) => {
	res.json(articles);
});

app.get('/news/:newspaperId', (req, res) => {
	const newspaperId = req.params.newspaperId;

	const [newspaper] = newspapers.filter(
		(newspaper) => newspaper.name === newspaperId
	);
	const { address, base } = newspaper;

	axios
		.get(address)
		.then((response) => {
			const html = response.data;
			const $ = cheerio.load(html);
			const articleList = [];

			$('a:contains("climate")', html).each(function () {
				const title = $(this).text();
				const url = $(this).attr('href');

				articleList.push({
					title,
					url: base + url,
					source: newspaperId,
				});
			});
			res.json(articleList);
		})
		.catch((err) => console.log('--error--', err));
});

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`));
