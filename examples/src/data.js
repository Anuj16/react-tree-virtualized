import folderIcon from './folder.svg';

const generateResponse = () => {
    let result = [];

    for(var i=1; i<=2000; i++) {
        var node = {
            label: 'node-1-' + i,
            value: String(Math.random(1, 10000) + 1),
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

const nodes = [
    {
        label: 'node-1',
        value: '0-0',
        level: 0,
        icon: folderIcon,
        isLeaf: false,
        checked: true,
        disabled: false,
        expanded: true,
        children: generateResponse(),
    },
    {
        label: 'node-2',
        value: '0-1',
        level: 0,
        icon: folderIcon,
        isLeaf: false,
        checked: false,
        disabled: false,
        expanded: true,
        children: [
            {
                label: 'node-2-0',
                value: 'node-2-0',
                level: 1,
                icon: folderIcon,
                isLeaf: false,
                checked: false,
                disabled: false,
                expanded: false,
                children: []
            },
            {
                label: 'node-2-1',
                value: '0-1-1',
                level: 1,
                icon: folderIcon,
                isLeaf: false,
                checked: false,
                disabled: false,
                expanded: false,
                children: []
            },
        ]
    },
];

export {
    nodes,
}