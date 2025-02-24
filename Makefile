install-backend:
	cd backend && reinstall.bat

install-frontend:
	cd frontend && npm install

install: install-backend install-frontend

run-backend:
	cd backend && run.bat

run-frontend:
	cd frontend && run.bat

.DEFAULT_GOAL := install
