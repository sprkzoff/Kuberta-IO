# Kuberta-IO
A platform for information operation using text generation (For educational purpose). This project is a part of 2110594 Natural Language Processing Course (2/2020).

### Group members
1. Thammakorn Kobkuachaiyapong	6030272021
2. Thanapat Sanguansab 		      6030249621
3. Phathit Sriburi			        6031041521
4. Peeranuth Kehasukcharoen	    6030416021
5. Phatcharapon Jumruspun		    6031040921

## Repository Structure
1. frontend - the user interface of the project created by ReactJS
2. backend - the text generation part which run as RESTful api created by Django
3. notebooks - POC code and evaluation

## How to run the project
In frontend

1. `cd frontend`
2. Install dependencies by using the command `npm install`
3. Run `npm start` , This should run the frontend on port 3000.

In backend

1. `cd backend`
2. Install dependencies by using the command `pip install -r requirements.txt`
3. Put the `model.pth` in the folder `/backend/text_gen/model` (In this case, we don't provide the model due to the effect on national security)
4. Run `python manage.py runserver` , This should run the backend on port 8000
