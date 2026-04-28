db = db.getSiblingDB('pokemon-db');

db.createUser({
  user: 'pokemon-user',
  pwd: 'pokemon-password',
  roles: [
    {
      role: 'readWrite',
      db: 'pokemon-db'
    }
  ]
});