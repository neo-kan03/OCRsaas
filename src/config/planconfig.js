const PLAN_CONFIG = {
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

window.PLAN_CONFIG_OBJ = PLAN_CONFIG;
export default PLAN_CONFIG;