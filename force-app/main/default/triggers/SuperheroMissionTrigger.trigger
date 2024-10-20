trigger SuperheroMissionTrigger on Superhero_Mission__c (after insert, before update) {

    if (trigger.isAfter && trigger.isInsert) {
        // todo send emails 
    }

    if (trigger.isBefore && trigger.isUpdate) {

        /*
        Хочу чтобы, когда кто-то из героев завершает миссию:
○
Статус Superhero Mission должен быть изменен на Completed
○
Статус Mission Assignment должен быть изменен на Completed (ассаймент героя который завершил
задание)
○
Статус Mission Assignment должен быть изменен на Failed (ассайменты остальных героев)
○
Создатель миссии узнал об этом по Электронной почте
        */

        // Map<Id, Superhero_Mission__c> newMissionsMap = new Map<Id, Superhero_Mission__c>(
        //     [SELECT Status__c FROM Superhero_Mission__c WHERE Id IN :Trigger.new]
        // );
        List<Superhero_Mission__c> completedMissions = new List<Superhero_Mission__c>();
        for (Id missionId : Trigger.newMap.keySet()) {
            // if (Trigger.newMap.get(missionId).Status__c == 'Completed' && Trigger.oldMap.get(missionId).Status__c != Trigger.newMap.get(missionId).Status__c) {
            //     completedMissions.add(Trigger.newMap.get(missionId));
            // }
        }

        List<Mission_Assignment__c> assignmentsToUpdate = new List<Mission_Assignment__c>();
        Set<Id> missionCompleteRecipients = new Set<Id>();
        List<Superhero_Mission__c> missionsWithAssignments = [SELECT CreatedById, LastModifiedById, (SELECT Status__c FROM Mission_Assignments__r)
            FROM Superhero_Mission__c WHERE Id IN :completedMissions];
        for (Superhero_Mission__c mission : missionsWithAssignments) {
            for (Mission_Assignment__c assignment : mission.Mission_Assignments__r) {
                assignment.Status__c = assignment.Mission__r.LastModifiedById == UserInfo.getUserId()
                    ? 'Completed'
                    : 'Failed';
                assignmentsToUpdate.add(assignment);
            }

            missionCompleteRecipients.add(mission.CreatedById);
        }

        update assignmentsToUpdate;
        // todo send emails to missionCompleteRecipients
    }

}