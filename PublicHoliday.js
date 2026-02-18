export async function action(data, callback) {

	try {

		const tblActions = {
			getHolidays: () => getHolidays(data.client)
		};

		info("PublicHoliday:", data.action.command, L.get("plugin.from"), data.client);

		await tblActions[data.action.command]();

	} catch (err) {
		if (data.client) Avatar.Speech.end(data.client);
		if (err.message) error(err.message);
	}

	callback();
}

async function getHolidays(client) {

	const CleApi = Config.modules.PublicHoliday.CleApi;

	if (!CleApi) {
		Avatar.speak("Pas de clé API dans le fichier propriété", client, () => {
			Avatar.Speech.end(client);
		});
		return; // IMPORTANT
	}

	try {

		const response = await fetch(`https://anyapi.io/api/v1/holidays?country=FR&language=fr&apiKey=${CleApi}`);

		if (!response.ok) {
			throw new Error(`Code erreur: ${response.status}`);
		}

		const data = await response.json();
		const holidays = data.holidays.slice(0, 13);

		const mois = [
			"janvier","février","mars","avril","mai","juin",
			"juillet","août","septembre","octobre","novembre","décembre"
		];

		holidays.forEach((holiday, index) => {

			const d = new Date(holiday.date);

			const message = `${d.getDate()} ${mois[d.getMonth()]} ${d.getFullYear()} : ${holiday.name}.`;

			setTimeout(() => {
				Avatar.speak(message, client, () => {

					// FIN quand dernier message
					if (index === holidays.length - 1) {
						Avatar.Speech.end(client);
					}

				});
			}, index * 6000);

		});

	} catch (error) {
		Avatar.speak(`Erreur API : ${error.message}`, client, () => {
			Avatar.Speech.end(client);
		});
	}
}
