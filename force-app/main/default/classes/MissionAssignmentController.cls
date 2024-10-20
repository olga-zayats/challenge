public without sharing class MissionAssignmentController {

    static final Integer ACTIVE_ASSIGNMENT_LIMIT = 3;

    @AuraEnabled
    public static void createMissionAssignments(Map<Id, List<Id>> heroAndMissionIds) {
        try {
            List<Mission_Assignment__c> assignmentsToInsert = new List<Mission_Assignment__c>();

            // todo badge for failed mission?
            for (Id heroId : heroAndMissionIds.keySet()) {
                if (getNumberOfActiveAssignments(heroId) + heroAndMissionIds.get(heroId).size() > ACTIVE_ASSIGNMENT_LIMIT) {
                    throw new HandledException('You cannot take more than ' + ACTIVE_ASSIGNMENT_LIMIT + ' active mission assignments!');
                }

                for (Id missionId : heroAndMissionIds.get(heroId)) {
                    assignmentsToInsert.add(new Mission_Assignment__c(Hero__c = heroId, Mission__c = missionId, Status__c = 'In Progress'));
                }
            }

            insert assignmentsToInsert;
        } catch(Exception e) {
            throw new HandledException('Something went wrong: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static void completeMissions(Map<Id, List<Id>> heroAndMissionIds) {
        try {
            Set<Id> allMissionIds = new Set<Id>();
            for (Id heroId : heroAndMissionIds.keySet()) {
                allMissionIds.addAll(heroAndMissionIds.get(heroId));
            }

            List<Mission_Assignment__c> assignmentsToUpdate = new List<Mission_Assignment__c>();
            List<Mission_Assignment__c> allAssignments = [SELECT Status__c, Hero__c, Mission__c FROM Mission_Assignment__c
                WHERE Hero__c IN :heroAndMissionIds.keySet() AND Mission__c IN :allMissionIds AND Status__c = 'In Progress'
                ORDER BY Hero__c];
            for (Mission_Assignment__c assignment : allAssignments) {
                if (heroAndMissionIds.get(assignment.Hero__c).contains(assignment.Mission__c)) {
                    assignment.Status__c = 'Completed';
                    assignmentsToUpdate.add(assignment);
                }
            }

            update assignmentsToUpdate;
        } catch (Exception e) {
            throw new HandledException('Something went wrong: ' + e.getMessage());
        }
    }

    static Integer getNumberOfActiveAssignments(Id heroId) {
        return [SELECT COUNT() FROM Mission_Assignment__c WHERE Hero__c = :heroId];
    }

    public class HandledException extends Exception {}
}