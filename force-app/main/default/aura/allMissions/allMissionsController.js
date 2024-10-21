({
    init: function (cmp, event, helper) {
        cmp.set('v.columns', helper.getColumns());

        helper.retrieveMissionsData(cmp, 20);
    },

    handleRowClick: function(cmp, event, helper) {
        var payload = {
            recordId: event.currentTarget.dataset.id,
        };
        cmp.find("missionMessageChannel").publish(payload);
    },

    handleScroll: function(cmp, event, helper) {
        var scrollTop = event.target.scrollTop
        var scrollHeight = event.target.scrollHeight
        var clientHeight = event.target.clientHeight
        
        if (!cmp.get("v.allMissionsLoaded") && !cmp.get("v.isLoading")
            && (scrollHeight - clientHeight <= scrollTop + 20)) {
            cmp.set("v.isLoading", true);
            helper.retrieveMissionsData(cmp, 10);
        }
    },

    handleReceiveMessage: function(cmp, event, helper) {
        const status = event.getParam('status');
        if (!status) return;

        var data = cmp.get("v.data");
        var indexOfRowToUpdate = data.findIndex(row => row.id == event.getParam('recordId'));
        var rowToUpdate = Object.assign({}, data[indexOfRowToUpdate]);

        var statusField = Object.assign({}, rowToUpdate.cells[rowToUpdate.cells.length - 1]);
        statusField.value = status;
        statusField.customClasses = helper.badgeCssClasses[status] || ''

        rowToUpdate.cells.splice(rowToUpdate.cells.length - 1, 1, statusField);
        data.splice(indexOfRowToUpdate, 1, rowToUpdate);

        cmp.set("v.data", data);
    }

});