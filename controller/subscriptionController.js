//import { PLAN_CONFIG } from "../config/planconfig.js";

const SubscriptionController = {
    async usoGratuito(subscriptionId) {
        const ref = db.collection("subscriptions").doc(subscriptionId)
        const doc = await ref.get()
        const data = doc.data()
        
        const dia = getToday()

        if(data.dateUsageToday !== dia){
            data.usageToday = 0; // Reset en memoria también
            await ref.update({
                usageToday: 0,
                dateUsageToday: dia
            })
        }

        if(data.usageToday < data.maxFactPerDays)   {
            let uso = data.usageToday + 1
            await ref.update({
                usageToday: uso
            })
            return uso
        } else {
            console.warn("Has alcanzado el límite diario de facturas.");
            return false;
        }
    }
}

function getToday() {
    return new Date().toISOString().split("T")[0];
}