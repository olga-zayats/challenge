({
    init: function (cmp, event, helper) {
        cmp.set('v.columns', helper.getColumns());

        helper.retrieveMissionsData(cmp, 20);
    },

    loadMoreMissions: function(cmp, event, helper) {
        helper.retrieveMissionsData(cmp, 10);
    }

});