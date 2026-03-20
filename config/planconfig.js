window.PLAN_CONFIG = class PLAN_CONFIG {
    constructor() {
        this.PLAN_CONFIG = {
            gratis: {
                maxUser: 1,
                maxFactPerDays: 10
            },
            pro: {
                maxUser: 5,
                maxFactPerDays: 100
            },
            premium: {
                maxUser: 9999,
                maxFactPerDays: 9999
            }
        };
    }
};