import { db } from '../config/firebase';

const SubscriptionController = {
    async usoGratuito(subscriptionId) {
        if (!subscriptionId) return false;
        const ref = db.collection("subscriptions").doc(subscriptionId)
        const doc = await ref.get()
        if (!doc.exists) return false;
        const data = doc.data()
        
        const dia = getLocalToday()

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

function getLocalToday() {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
}

window.SubscriptionController = SubscriptionController;
export default SubscriptionController;