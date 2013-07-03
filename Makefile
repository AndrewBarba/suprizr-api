server:
	foreman start

prod:
	git push heroku master
	heroku config:set ENV=production --account suprizr-api

tests:
	mocha
