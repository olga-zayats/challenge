({
    badgeCssClasses: {
        'Available': 'slds-theme_success',
        'Completed': 'slds-badge_inverse'
    },

    getColumns: function () {
        var columns = [
            {label: 'Rank', fieldName: 'Complexity_Rank__c', type: 'custom-badge'},
            {label: 'Mission', fieldName: 'Subject__c', type: 'text'},
            {label: 'Guild', fieldName: 'GuildName', type: 'text'},
            {label: 'Status', fieldName: 'Status__c', type: 'badge'}
        ];

        return columns;
    },

    retrieveMissionsData: function (cmp, numberofRecords) {
        var action = cmp.get("c.getMissions");
        action.setParams({
            "offset": cmp.get("v.offset"),
            "numberOfRecords": numberofRecords
        });
        action.setCallback(this, function(response){
            var state = response.getState();
            if (state === "SUCCESS") {
                var retrievedMissions = response.getReturnValue();

                if (!retrievedMissions.length) return;

                for (const mission of retrievedMissions) {
                    mission.GuildName = mission.Guild__r.Name;
                }
                var processedMissions = this.populateTableBodyData(cmp, retrievedMissions);
                var data = cmp.get('v.data');
                data.push(...processedMissions);
                cmp.set("v.data", data);
                cmp.set('v.offset', cmp.get('v.offset') + Math.min(numberofRecords, processedMissions.length));
            }
        });

        $A.enqueueAction(action);
    },

    populateTableBodyData: function(cmp, missions) {
        var result = [];

        for (const mission of missions) {
            var row = {id: mission.Id, cells: []};
            for (const column of cmp.get('v.columns')) {
                row.cells.push({
                    value: mission[column.fieldName],
                    fieldType: column.type,
                    customClasses: column.type === 'badge'
                        ? this.badgeCssClasses[mission[column.fieldName]] || ''
                        : column.type === 'custom-badge'
                            ? 'custom-badge-dark'
                            : ''
                });
            }
            result.push(row);
        }

        return result;
    }

});