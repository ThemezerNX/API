import Layout from "../../../filetypes/Layout";

export default async (_parent, {id}, _context, _info) => {
    const layout = new Layout(true);
    await layout.loadId(id);
    return layout.toJSON();
}