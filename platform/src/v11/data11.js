// v11 data: the real portfolio of startups from past Catalyst batches (stored in the backend, not here)
SF.VERSION = 'v11';
SF.ROADMAP.forEach(r => { if (r[0] === 'v10') r[3] = 'done'; if (r[0] === 'v11') { r[3] = 'now'; r[2] = 'The first real data: the portfolio of startups from past Catalyst batches. Founders sign in with their own startup login, on the website or in the Telegram bot, and confirm their details in two minutes. The Org team sees who has confirmed. Stored in a real database with server-side access rules.'; } if (r[0] === 'v12') r[3] = 'next'; });

// The questions a founder answers, in order (the Telegram bot asks the same ones)
SF.PF_STAGES = ['Idea', 'Prototype', 'MVP', 'First users', 'Revenue'];
SF.PF_STATUS = [['active', 'Active'], ['paused', 'Paused'], ['closed', 'Closed']];
SF.PF_SINCE = [['pilot', 'Pilot with a company'], ['contract', 'Contract'], ['investment', 'Investment'], ['hired', 'Hired or got a job offer'], ['nothing', 'Nothing yet']];
SF.PF_SECTORS = ['AI, Data & Cybersecurity', 'Industry & Manufacturing', 'Energy & Cleantech', 'Fintech', 'Edtech', 'Healthtech', 'Agrotech', 'E-commerce & Retail', 'Logistics & Transport', 'Proptech & Construction', 'Media & Entertainment', 'Other'];
SF.PF_STEPS = ['Your startup', 'Team', 'Stage', 'Status', 'Since Catalyst', 'Link', 'Recommendations', 'Confirm'];
SF.PF_BOT = 'https://t.me/StartupFest_Bot?start=checkin';
