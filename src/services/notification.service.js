export const NotificationService = {
  async get(device_token) {
    try {
      const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: device_token,
          sound: "default",
          title: "Teste",
          body: "ALOOOOOOOOOOOOOOOOO",
        }),
      });

      const data = await response.json();
      return { success: true, expoResponse: data }; 
    } catch (err) {
      console.error(err);
      throw new Error("Erro ao enviar notificação"); 
    }
  },
};
