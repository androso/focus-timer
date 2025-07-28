CREATE TABLE `refresh_tokens` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`token` text NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`is_revoked` integer DEFAULT false,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);

-- Create indexes for better performance
CREATE UNIQUE INDEX `refresh_tokens_token_unique` ON `refresh_tokens` (`token`);
CREATE INDEX `IDX_refresh_tokens_user_id` ON `refresh_tokens` (`user_id`);
CREATE INDEX `IDX_refresh_tokens_expires_at` ON `refresh_tokens` (`expires_at`);
