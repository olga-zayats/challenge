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
    }

});