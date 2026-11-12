#!/bin/sh
# Compila las ruletas y publica dist/ en la rama gh-pages.
set -e
REPO=sorteo-concurso-club-2026
npm run build
touch dist/.nojekyll
cd dist
rm -rf .git
git init -q -b gh-pages
git add -A
git commit -q -m "Publica las ruletas"
git push -q -f "git@github.com:VManuelSM/$REPO.git" gh-pages
rm -rf .git
echo "Publicado: https://vmanuelsm.github.io/$REPO/"
