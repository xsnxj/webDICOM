function Tree(selector) {
    this.$el = $(selector);
    this.parsedFileList = [];
    var dcmParser = new DcmParser();
    var dcmTree = {};
    var dcmList = [];
    var _html = [];
    var self = this;

    this.change = function(e) {
        _html = [];
        dcmTree = {};
        dcmList = [];
        self.parsedFileList = [];
        var fileList = e.target.files;
        $('#fileTree').empty();
        $('#errorMsg').empty();
        // TODO: optimize this so we're not going through the file list twice (here and in buildFromPathList).
        for(var i = 0; i < fileList.length; i++) {
            if(fileList[i].type === "application/dicom") {
                dcmList.push(fileList[i]);
            }
        }

        dcmParser.parseFiles(dcmList, function(e) {
            self.parsedFileList = e;
            var tmpHtml = dcmRender(buildFromDcmList(self.parsedFileList));

            $('#fileTree').html(tmpHtml).tree({
                expanded: 'li:first'
            });
        });
    };

    var buildFromDcmList = function(files) {
        for(var i = 0; i < files.length; i++) {
            var file = files[i];
            var level1 = file.PatientsName ? file.PatientsName : 'undefined';
            var level2 = file.SeriesDescription ? file.SeriesDescription : 'undefined';

            if(!dcmTree[level1]) {
                dcmTree[level1] = {};
                dcmTree[level1][level2] = [];
                dcmTree[level1][level2].push(i);
            } else {
                if(!dcmTree[level1][level2]) {
                    dcmTree[level1][level2] = [];
                    dcmTree[level1][level2].push(i);
                } else {
                    dcmTree[level1][level2].push(i);
                }
            }
        }
        return dcmTree;
    };

    var dcmRender = function(tree) {
        if(tree) {
            for(var object in tree) {
                if($.isArray(tree[object])) { // series have an array - patients a object
                    _html.push('<li><a href="#" data-type="file" data-index="' + tree[object] + '" >', object, '</a></li>');
                } else {
                    _html.push('<li><a href="#" data-type="folder">', object, '</a>');
                    _html.push('<ul>');
                    dcmRender(tree[object]);
                    _html.push('</ul>');
                }
            }
            return _html.join('');
        }
    };
}