### Firstly

copy .env.example content to .env and setup mysql creds in config/cofig.js file

### create db

npx sequelize-cli db:create

## running default migration

npx sequelize-cli db:migrate

## create db migration

npx sequelize-cli model:generate --name table_name --attributes firstName:string,lastName:string,email:string

## running migration

npx sequelize-cli db:migrate

## undo migration

npx sequelize-cli db:migrate:undo

## create migration only

npx sequelize-cli migration:generate --name name

## inspired from

[@muddassarshaikh/commonAPI](https://github.com/muddassarshaikh/commonAPI)

## POSTMAN Link

[https://www.getpostman.com/collections/692142bf3bd854521e72](https://www.getpostman.com/collections/692142bf3bd854521e72)
