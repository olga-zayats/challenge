public class SendEmailBatch implements Database.Batchable<sObject>, Database.Stateful {

    List<Superhero_Mission__c> missions = new List<Superhero_Mission__c>();
    Map<Id, List<Superhero_Mission__c>> missionsByUserId = new Map<Id, List<Superhero_Mission__c>>();

    public SendEmailBatch(List<Superhero_Mission__c> insertedMissions) {
        missions = insertedMissions;
    }

    public Database.QueryLocator start(Database.BatchableContext bc) {
        return Database.getQueryLocator('SELECT Name, (SELECT Email FROM Users), (SELECT Guild__c FROM Heroes__r) '
            + 'FROM Contact WHERE ID IN (SELECT Contact__c FROM Hero__c)');
    }
   
    public void execute(Database.BatchableContext bc, List<sObject> records) {
        for (sObject record : records) {
            Contact contact = (Contact) record;

            // assuming there's only one hero per contact and only one contact per user
            User user = contact.Users[0];
            Hero__c hero = contact.Heroes__r[0];

            for (Superhero_Mission__c mission: missions) {
                if (!missionsByUserId.containsKey(user.Id)) {
                    missionsByUserId.put(user.Id, new List<Superhero_Mission__c>());
                }

                if (mission.Is_Public__c || mission.Guild__c == hero.Guild__c)  {
                    missionsByUserId.get(user.Id).add(mission);
                }
            }
        }
    }
   
    public void finish(Database.BatchableContext bc) {
        SuperheroMissionController.sendEmailsToTheSelectedUsers(missionsByUserId, true);
    }
}