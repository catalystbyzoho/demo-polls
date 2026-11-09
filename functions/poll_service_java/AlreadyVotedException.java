
public class AlreadyVotedException extends Exception {
	private static final long serialVersionUID = 1L;
	private String message;

	public AlreadyVotedException(String message) {
		super();
		this.message = message;
	}

	@Override
	public String getMessage() {
		return this.message;
	}

}
