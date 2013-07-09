server:
	foreman start

prodf:
	git push heroku master
	heroku config:set NODE_ENV=production --account suprizr-api

prod:
	make tests
	make prodf

tests:
	mocha --timeout 120000
