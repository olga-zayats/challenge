trigger MissionAssignmentTrigger on Mission_Assignment__c (before update) {

    if (trigger.isBefore && trigger.isUpdate) {
        Set<Id> completedMissionIds = new Set<Id>();
        for (Id assignmentId : Trigger.newMap.keySet()) {
            if (Trigger.newMap.get(assignmentId).Status__c == 'Completed' && Trigger.oldMap.get(assignmentId).Status__c != Trigger.newMap.get(assignmentId).Status__c) {
                completedMissionIds.add(Trigger.newMap.get(assignmentId).Mission__c);
            }
        }

        List<Mission_Assignment__c> connectedAssignments = [SELECT Status__c, Mission__r.Subject__c, Mission__r.CreatedById, Hero__r.Contact__r.Name FROM Mission_Assignment__c
            WHERE Mission__c IN :completedMissionIds];
        List<Mission_Assignment__c> failedAssignments = new List<Mission_Assignment__c>();
        Map<Id, List<Superhero_Mission__c>> completedMissionsCreators = new Map<Id, List<Superhero_Mission__c>>();
        for (Mission_Assignment__c assignment : connectedAssignments) {
            if (Trigger.newMap.keySet().contains(assignment.Id)) {
                if (!completedMissionsCreators.containsKey(assignment.Mission__r.CreatedById)) {
                    completedMissionsCreators.put(assignment.Mission__r.CreatedById, new List<Superhero_Mission__c>());
                }

                completedMissionsCreators.get(assignment.Mission__r.CreatedById).add(
                    new Superhero_Mission__c(Id = assignment.Mission__c, Subject__c = assignment.Mission__r.Subject__c)
                );
                continue;
            }

            assignment.Status__c = 'Failed';
            failedAssignments.add(assignment);
        }

        update failedAssignments;

        SuperheroMissionController.sendEmailsToTheSelectedUsers(completedMissionsCreators, false);
    }

}