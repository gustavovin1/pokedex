export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"
cd /home/gustavo_cristofolini/Documentos/clones/pokedex/pokedex-front
nvm use 22
npm run dev & cd /home/gustavo_cristofolini/Documentos/clones/pokedex/pokedex-api
php artisan serve

