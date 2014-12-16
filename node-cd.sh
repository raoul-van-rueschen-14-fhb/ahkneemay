echo "Stop server"
echo "==========="

cd /home/ubuntu/ahkneemay/
forever stop index.js

echo "Update code"
echo "==========="

git fetch
git reset --hard origin/master

echo "Install dependencies"
echo "===================="

npm install

echo "Restart server"
echo "=============="

forever start index.js 8080 production
