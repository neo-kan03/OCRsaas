export default class Subscription {
    constructor({ id, owner, userName, tipo, maxUser, maxFactPerDays, usageToday, dateUsageToday }) {
        this.id = id;
        this.owner = owner;
        this.userName = userName;
        this.tipo = tipo;
        this.maxUser = maxUser;
        this.maxFactPerDays = maxFactPerDays;
        this.usageToday = usageToday;
        this.dateUsageToday = dateUsageToday;
    }
}

window.Subscription = Subscription;