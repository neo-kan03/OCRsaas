window.Subscription = class Subscription {
  constructor({ tipo, ownerId, maxUser, maxFactPerDays, users, usageToday, dateUsageToday }) {
    this.tipo = tipo || "gratis";
    this.ownerId = ownerId;
    this.maxUser = maxUser || 1;
    this.maxFactPerDays = maxFactPerDays || 10;
    this.users = users || [];
    this.usageToday = usageToday || 0;
    this.dateUsageToday = dateUsageToday || "";
  }

  isOwner(uid) {
    return this.ownerId === uid;
  }

  canAddUser() {
    return this.users.length < this.maxUser;
  }

  incrementUsage() {
    if (this.usageToday >= this.maxFactPerDays) {
      throw new Error("Has alcanzado el límite diario de acciones");
    }
    this.usageToday++;
  }
};