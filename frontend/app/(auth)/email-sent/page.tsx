export default function EmailSentPage() {
	return (
		<div className="h-screen bg-neutral-100 flex items-center justify-center">
			<div className="bg-white p-6 shadow rounded">
				<h2 className="text-xl text-neutral-700 font-semibold">
					Check your email
				</h2>
				<p className="text-neutral-600 mt-2">
					A verification link has been sent. Please verify to
					continue.
				</p>
			</div>
		</div>
	);
}
