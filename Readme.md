## Как завести фронтовые тулзы ##

1.	На машине должен быть Ruby, Node.js, PhantomJS

		http://nodejs.org/
		http://www.ruby-lang.org/
		http://phantomjs.org/

2.	Устанавливаем grunt:

		npm install -g grunt-cli

3.	Заходим в папку статики `static` и выполняем

		npm install

4.	Выполняем `grunt`. Вся статика пересобирается, запускается watcher изменений исходников.

		a.	на тестовом сервере достаточно выполнить команду `grunt build`. Можно даже внести её в конфиг Continuous Integration.
		
		b.	на продакшен сервере достаточно выполнить команду `grunt deploy`
