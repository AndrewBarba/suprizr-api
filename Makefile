server:
	foreman start

prod:
	make tests
	git push heroku master
	heroku config:set NODE_ENV=production --account suprizr-api

tests:
	mocha --timeout 10000
