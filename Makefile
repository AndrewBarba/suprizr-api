server:
	foreman start

prod:
	git push heroku master

tests:
	mocha
