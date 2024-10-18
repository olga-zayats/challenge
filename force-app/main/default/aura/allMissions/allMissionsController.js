({
    init: function (cmp, event, helper) {
        cmp.set('v.columns', helper.getColumns());

        helper.retrieveMissionsData(cmp, 20);
    },

    loadMoreMissions: function(cmp, event, helper) {
        helper.retrieveMissionsData(cmp, 10);
    },

    handleRowClick: function(cmp, event, helper) {
        var payload = {
            recordId: event.currentTarget.dataset.id,
        };
        cmp.find("missionMessageChannel").publish(payload);
    }

});