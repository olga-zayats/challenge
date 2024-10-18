public without sharing class SuperheroMissionController {

    @AuraEnabled(cacheable=true)
    public static List <Superhero_Mission__c> getMissions(Integer offset, Integer numberOfRecords) {
        return [SELECT Complexity_Rank__c, Subject__c, Guild__r.Name, Status__c
            FROM Superhero_Mission__c
            WHERE Is_Public__c = true OR Guild__r.Name = :getCurrentUserHeroGuild()
            ORDER BY CreatedDate ASC
            LIMIT :numberOfRecords
            OFFSET :offset];
    }

    private static String getCurrentUserHeroGuild() {
        String result = '';

        List<Hero__c> currentUserHeroList = [SELECT Guild__r.Name FROM Hero__c
            WHERE Contact__c IN (SELECT ContactId FROM User WHERE Id = :UserInfo.getUserId()) LIMIT 1];

        return currentUserHeroList.isEmpty()
            ? result
            : currentUserHeroList[0].Guild__r.Name;
    }

    @AuraEnabled(cacheable=true)
    public static Superhero_Mission__c getMissionById(Id recordId) {
        return [SELECT Complexity_Rank__c, Subject__c, Guild__r.Name, Status__c, Reward__c, Deadline__c
            FROM Superhero_Mission__c
            WHERE Id = :recordId];
    }

    public static void acceptMission() {

    }

}