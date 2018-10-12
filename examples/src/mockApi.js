const delay = 2000;
import folderIcon from './folder.svg';

// This file mocks a web API by working with the hard-coded data below.
// It uses setTimeout to simulate the delay of an AJAX call.
// All calls return promises.

const generateResponse = () => {
    let result = [];

    for(var i=1; i<=2000; i++) {
        var node = {
            label: 'Desktop' + i,
            value: Math.random(1, 10000) + 1,
            level: 1,
            icon: folderIcon,
            isLeaf: true,
            checked: false,
            disabled: false,
            expanded: false,
            children: []
        };

        result.push(node);
    }

    return result;
}

const getExpandedFolderContent = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(Object.assign({}, generateResponse()));
      }, delay);
    });
 };

export {
    getExpandedFolderContent
};
