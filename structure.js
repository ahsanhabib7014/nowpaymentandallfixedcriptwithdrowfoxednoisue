const fs = require('fs');
const path = require('path');

function printTree(dir, prefix = '') {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  const filtered = files.filter(file => 
    !['node_modules', '.next', '.git', 'package-lock.json'].includes(file.name)
  );
  
  filtered.forEach((file, index) => {
    const isLast = index === filtered.length - 1;
    const marker = isLast ? '└── ' : '├── ';
    console.log(prefix + marker + file.name);
    
    if (file.isDirectory()) {
      printTree(path.join(dir, file.name), prefix + (isLast ? '    ' : '│   '));
    }
  });
}

console.log('Project Structure:');
printTree('.');