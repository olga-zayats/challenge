({
    badgeCssClasses: {
        'Available': 'slds-theme_success',
        'Completed': 'slds-badge_inverse',
        'In Progress': 'slds-badge_blue'
    },

    getColumns: function () {
        var columns = [
            {label: 'Rank', fieldName: 'Rank', type: 'custom-badge'},
            {label: 'Mission', fieldName: 'Subject', type: 'text'},
            {label: 'Guild', fieldName: 'GuildName', type: 'text'},
            {label: 'Status', fieldName: 'Status', type: 'badge'}
        ];

        return columns;
    },

    retrieveMissionsData: function (cmp, numberOfRecords) {
        var action = cmp.get("c.getMissions");
        action.setParams({
            "offset": cmp.get("v.offset"),
            "numberOfRecords": numberOfRecords
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var retrievedMissions = response.getReturnValue();

                if (!retrievedMissions.length) {
                    cmp.set("v.allMissionsLoaded", true);
                    return;
                }

                var processedMissions = this.populateTableBodyData(cmp, retrievedMissions);
                var data = cmp.get('v.data');
                data.push(...processedMissions);
                cmp.set("v.data", data);
                cmp.set('v.offset', cmp.get('v.offset') + Math.min(numberOfRecords, processedMissions.length));
            } else if (state === "ERROR") {
                var errors = response.getError();
                console.error(errors && errors.length && errors[0].message
                    ? 'Error message: ' + errors[0].message
                    : 'Unknown error'
                );
            }
            cmp.set("v.isLoading", false);
        });

        $A.enqueueAction(action);
    },

    populateTableBodyData: function(cmp, missions) {
        var result = [];

        missions.forEach(mission => {
            var row = {id: mission.Id, cells: []};

            cmp.get('v.columns').forEach(column => {
                row.cells.push({
                    value: mission[column.fieldName],
                    fieldType: column.type,
                    customClasses: column.type === 'badge'
                        ? this.badgeCssClasses[mission[column.fieldName]] || ''
                        : column.type === 'custom-badge'
                            ? 'custom-badge-dark'
                            : ''
                });
            });

            result.push(row);
        });

        return result;
    }

});