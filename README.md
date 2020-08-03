### copy .env.example content to .env and setup mysql creds in config/cofig.js file

### create db
npx sequelize-cli db:create

## create db migration
npx sequelize-cli model:generate --name table_name --attributes firstName:string,lastName:string,email:string

## running migration
npx sequelize-cli db:migrate

## code structure used from 
[@muddassarshaikh/commonAPI]( https://github.com/muddassarshaikh/commonAPI )
